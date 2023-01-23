import polka from "polka";
import sirv from "sirv";

polka()
    .use(sirv(".", { dev: true, single: true }))
    .get("/", (req, res) => {
        res.end();
    })
    .listen(7020, () => {});
