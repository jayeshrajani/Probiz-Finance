const mongoose = require('mongoose');
const Area = require('../models/area.model');
const dbConfig = require('../config/db.config');

// Connect to MongoDB and remove duplicates
async function removeDuplicateAreas() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(dbConfig.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✓ Connected to MongoDB successfully\n');

        console.log('Finding duplicate areas...\n');

        // Get all areas (not deleted)
        const allAreas = await Area.find({ deleteFlag: false }).sort({ createdAt: 1 });
        console.log(`Total areas in database: ${allAreas.length}\n`);

        // Group areas by normalized name (case-insensitive)
        const areaMap = new Map();
        const duplicates = [];

        for (const area of allAreas) {
            const normalizedName = area.name.trim().toLowerCase();
            
            if (!areaMap.has(normalizedName)) {
                // First occurrence - keep this one
                areaMap.set(normalizedName, {
                    keep: area,
                    duplicates: []
                });
            } else {
                // Duplicate found
                const existing = areaMap.get(normalizedName);
                existing.duplicates.push(area);
                duplicates.push(area);
            }
        }

        console.log(`Found ${duplicates.length} duplicate area(s) to remove\n`);

        if (duplicates.length === 0) {
            console.log('✓ No duplicates found! Database is clean.\n');
            await mongoose.connection.close();
            console.log('Database connection closed.');
            process.exit(0);
        }

        // Show duplicates before removal
        console.log('Duplicate areas found:');
        console.log('='.repeat(60));
        
        const duplicateGroups = [];
        for (const [normalizedName, data] of areaMap.entries()) {
            if (data.duplicates.length > 0) {
                duplicateGroups.push({
                    name: data.keep.name,
                    keep: data.keep._id,
                    duplicates: data.duplicates.map(d => ({ id: d._id, name: d.name }))
                });
                console.log(`\n"${data.keep.name}" (keeping this one)`);
                console.log(`  ID: ${data.keep._id}`);
                data.duplicates.forEach(dup => {
                    console.log(`  ⚠ Duplicate: "${dup.name}" (ID: ${dup._id}) - will be removed`);
                });
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`\nTotal duplicates to remove: ${duplicates.length}`);
        console.log(`Areas to keep: ${areaMap.size - duplicateGroups.length + duplicateGroups.length}\n`);

        // Remove duplicates (soft delete by setting deleteFlag to true)
        let removedCount = 0;
        let errorCount = 0;

        for (const dup of duplicates) {
            try {
                dup.deleteFlag = true;
                await dup.save();
                removedCount++;
                console.log(`✓ Removed duplicate: "${dup.name}" (ID: ${dup._id})`);
            } catch (error) {
                errorCount++;
                console.log(`✗ Error removing "${dup.name}": ${error.message}`);
            }
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total areas in database: ${allAreas.length}`);
        console.log(`Duplicate groups found: ${duplicateGroups.length}`);
        console.log(`✓ Successfully removed: ${removedCount}`);
        console.log(`✗ Errors: ${errorCount}`);
        console.log(`Remaining unique areas: ${allAreas.length - removedCount}`);
        console.log('\n✓ Duplicate removal completed!');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    }
}

// Run the script
removeDuplicateAreas();


















