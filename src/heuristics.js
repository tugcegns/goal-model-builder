import h1 from "./images/h1.PNG";
import h2 from "./images/h2.PNG";
import h3 from "./images/h3.PNG";
import h4 from "./images/h4.PNG";
import h5 from "./images/h5.PNG";

/**
 * Data of the heuristics. 
 * 
 * Used in user story uploading page to draw and show the available heuristics
 * and also in the heuristic switching modal of the playground page.
 * 
 * New heuristics can easily be implemented in the frontend side through this array.
 * Simply add a new object to the HeuristicsData array.
 * @property {string} alt alternative text to display if the image in not available
 * @property {string} value value of the heuristic ("h1", "h2", "h3"). Each value should be unique
 * @property {string} text text to define the heuristic. Shown below the image in user story loading page and
 *           also in the heuristic switching button in playground
 * @property {*} src image source
 * @property {height:number} imageShape shape to be used in the user story uploading page
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