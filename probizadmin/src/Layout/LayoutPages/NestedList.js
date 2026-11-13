import * as React from "react";
import { Collapse, IconButton } from "@mui/material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Link } from "react-router-dom";
import dashboard from "../../images/dashboard.png";
import user from "../../images/user.png";
import employee from "../../images/employee.png";
import secure from "../../images/secure.png";
import unsecure from "../../images/unsecure.png";
import leads from "../../images/a.png";
import insurence from "../../images/insurence.png";
import real from "../../images/real.png";
import setting from "../../images/setting.png";
import contact from "../../images/contact.png";
import NewspaperIcon from "@mui/icons-material/Newspaper";

export default function NestedList() {
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleClick1 = () => {
    setOpen1(!open1);
  };

  const handleClick2 = () => {
    setOpen2(!open2);
  };

  const handleClick3 = () => {
    setOpen3(!open3);
  };

  return (
    <List
      sx={{ width: "100%", maxWidth: 450, backgroundColor: "#121942" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <Link to="/dashboard" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={dashboard} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Dashboard" sx={{ color: "white" }} />
        </ListItemButton>
      </Link>

      <Link to="/users" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={user} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Users" sx={{ color: "white" }} />
        </ListItemButton>
      </Link>

      <Link to="/employees" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={employee} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Employees" sx={{ color: "white" }} />
        </ListItemButton>
      </Link>

      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <img style={{ marginLeft: "8px" }} src={secure} />
        </ListItemIcon>
        <ListItemText primary="Secured Loan" sx={{ color: "white" }} />
        {open ? (
          <ExpandLess sx={{ color: "#fff" }} />
        ) : (
          <ExpandMore sx={{ color: "#fff" }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Link to="/home-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText primary="Home Loan" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>
          <Link to="/plot-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText primary="Plot purchase" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>
          <Link to="/plot-construction-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText
                primary="Plot construction"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>
          <Link to="/flat-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText primary="Flat purchase" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link to="/mortgage-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText primary="Mortgage Loans" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link
            to="/commercial-property-purchase-loan"
            style={{ textDecoration: "none" }}
          >
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText
                primary="Commercial property"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link
            to="/commercial-property-mortage-loan"
            style={{ textDecoration: "none" }}
          >
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText
                primary="Commercial Mortage"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/construction-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText
                primary="Construction Loan"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/balance-transfer" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText
                primary="Balance Transfer"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/homerenovation-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText primary="Home Renovation" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>
          <Link to="/balancetopuploan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon>
                {/* <IconButton>
              <img src={secure}/>
            </IconButton> */}
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    Balance TransferTop <br /> Up Loan
                  </>
                }
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>

      <ListItemButton onClick={handleClick2}>
        <ListItemIcon>
          <img style={{ marginLeft: "8px" }} src={unsecure} />
        </ListItemIcon>
        <ListItemText primary="Unsecured Loan" sx={{ color: "white" }} />
        {open ? (
          <ExpandLess sx={{ color: "#fff" }} />
        ) : (
          <ExpandMore sx={{ color: "#fff" }} />
        )}
      </ListItemButton>
      <Collapse in={open2} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Link to="/personal-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Personal Loan" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>
          <Link to="/pradhan-mantri-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Pradhan Mantri" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link to="/business-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Business Loan" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link to="/project-funding-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Project Funding" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link to="/credit-card" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Credit Card" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link to="/car-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Car Loan" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link to="/kisan-credit-card" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Kisan Credit" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link to="/education-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Education Loan" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>

          <Link to="/gold-loan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Gold Loan" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>

      <ListItemButton onClick={handleClick3}>
        <ListItemIcon>
          {/* <img style={{ marginLeft: "8px" }} src={unsecure} /> */}
          <img style={{ marginLeft: "8px" }} src={setting} />
        </ListItemIcon>
        <ListItemText primary="Services Leads" sx={{ color: "white" }} />
        {open ? (
          <ExpandLess sx={{ color: "#fff" }} />
        ) : (
          <ExpandMore sx={{ color: "#fff" }} />
        )}
      </ListItemButton>
      <Collapse in={open3} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Link to="/ca-services" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="CA  Services" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>
          <Link to="/real-estate-services" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary={
                  <>
                    Real Estate <br /> Services
                  </>
                }
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/dsa-services" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Loan DSA Franchise"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/legal-documentation" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary={
                  <>
                    Legal Documentation <br /> Registration Services
                  </>
                }
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/governmentbuisness" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary={
                  <>
                    Government Business <br /> Loan Services
                  </>
                }
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/digitalmarketing" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary={
                  <>
                    Digital Marketing
                    <br /> Services
                  </>
                }
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/creditcardscore" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Credit Score Check"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/estamp" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="E-Stamp Services"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>

          <Link to="/buisnessconsultation" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary={
                  <>
                    Business Consultation
                    <br /> Service
                  </>
                }
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>

     

      <ListItemButton onClick={handleClick1}>
        <ListItemIcon>
          <img style={{ marginLeft: "8px" }} src={insurence} />
        </ListItemIcon>
        <ListItemText primary="Insurance" sx={{ color: "white" }} />
        {open1 ? (
          <ExpandLess sx={{ color: "#fff" }} />
        ) : (
          <ExpandMore sx={{ color: "#fff" }} />
        )}
      </ListItemButton>
      <Collapse in={open1} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Link to="/health-insurance" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Health Insurance"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>
          <Link to="/automobile-insurance" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Automobile Insurance"
                sx={{ color: "white" }}
              />
            </ListItemButton>
          </Link>
          <Link to="/investment-plan" style={{ textDecoration: "none" }}>
            <ListItemButton>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary="Investment Plan" sx={{ color: "white" }} />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>

       <Link to="/rols" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={leads} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Account / Sales" sx={{ color: "white" }} />
        </ListItemButton>
      </Link>

      <Link to="/property" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={real} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Property" sx={{ color: "white" }} />
        </ListItemButton>
      </Link>
      {/* <Link to="#" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={real} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Real estate" sx={{ color: "white" }} />
        </ListItemButton>
      </Link> */}

      {/* <Link to="#" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={score} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Credit Score" sx={{ color: "white" }} />
        </ListItemButton>
      </Link> */}

      {/* <Link to="#" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={partner} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Partner With Us" sx={{ color: "white" }} />
        </ListItemButton>
      </Link> */}

      <Link to="/contacts" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              <img src={contact} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Contact" sx={{ color: "white" }} />
        </ListItemButton>
      </Link>
      <Link to="/newsletter" style={{ textDecoration: "none" }}>
        <ListItemButton>
          <ListItemIcon>
            <IconButton>
              {/* <img src={contact} /> */}
              <NewspaperIcon sx={{ color: "#fff" }} />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="NewsLetter" sx={{ color: "white" }} />
        </ListItemButton>
      </Link>
    </List>
  );
}
