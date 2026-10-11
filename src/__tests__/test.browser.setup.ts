// import the css / fonts used by the main app (See index.html) so that the browser screenshots match the styling of the application
import "./test.browser.css";
import "../../realworld/assets/theme/styles.css";
import { beforeEach, logout } from "./test.utils.tsx";

beforeEach(() => logout());
