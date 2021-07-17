import h1 from "./images/h1.PNG";
import h2 from "./images/h2.PNG";
import h3 from "./images/h3.PNG";
import h4 from "./images/h4.PNG";
import h5 from "./images/h5.PNG";

/**
 * Data of the heuristic choice elements
 * This data is used for creating heuristic choice elements {@Link ReactUSUpload}
 */
export const HeuristicsData = [
  {
    alt: "Role-Action",
    value: "h1",
    text: "Grouped Action Verbs",
    src: h1,
    imageShape: {height:250}
  },
  {
    alt: "Role-Topic",
    value: "h2",
    text: "Grouped Action Object",
    src: h2,
    imageShape: {height:250}    
  },
  {
    alt: "Role",
    value:"h3",
    text: "Without Role Boundary",
    src: h3,
    imageShape: {height:250}
  },
  {
    alt: "Role-Benefit",
    value: "h4",
    text: "Grouped Benefit",
    src: h4,
    imageShape: {height:250}
  },
  {
    alt: "Benefit",
    value: "h5",
    text: "Benefit Without Role Boundary",
    src: h5,
    imageShape: {height:250}
  }
]