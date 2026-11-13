import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getApihandler } from "../Apihandler";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

export default function NewsLetter() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getNewsLetter();
  }, []);

  const getNewsLetter = async () => {
    const res = await getApihandler("/getNewsLetter");
    console.log("get news letter api res --->", res);
    if (res.message === "Newsletters get successfully") {
      setData(res.data);
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Newsletter Subscribers
      </Typography>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <List>
          {data.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No subscribers found.
            </Typography>
          ) : (
            data.map((row, index) => (
              <React.Fragment key={row.email}>
                <ListItem>
                  <ListItemText primary={row.email} />
                </ListItem>
                {index < data.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </AdminLayout>
  );
}
