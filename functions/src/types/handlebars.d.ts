// Fix for genkit/dotprompt handlebars type issue
declare module "handlebars/dist/cjs/handlebars.js" {
  import Handlebars from "handlebars";
  export default Handlebars;
}
