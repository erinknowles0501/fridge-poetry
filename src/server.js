import polka from "polka";
import sirv from "sirv";

// TODO Build obj with keys/values and get port from there
const port = process.argv[2].split("=")[1];

polka()
    .use(sirv(".", { dev: true, single: true }))
    // .get("/", (req, res) => {
    //     res.end();
    // })
    // .get("/", (req, res) => {
    //     res.end();
    // })
    .listen(port ?? 7020, () => {});
