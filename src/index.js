const app = require("express")();
const faunadb = require("faunadb");
const client = new faunadb.Client({
  secret: "SECRET_KEY",
});

app.listen(5000, () => console.log("api on http://localhost:5000"));

const {
  Paginate,
  Get,
  Select,
  Match,
  Index,
  Create,
  Collection,
  Lambda,
  Var,
  Ref,
  Join,
  Call,
  Function: Fn,
} = faunadb.query;

app.get("/meow/:id", async (req, res) => {
  const doc = await client.query(Get(Ref(Collection("meows"), req.params.id)));

  res.send(doc);
});

app.get("/meow", async (req, res) => {
  const docs = await client.query(
    Paginate(Match(Index("meows_by_user"), 
    Call(Fn("getUser", "test_user"))))
  );

  res.send(docs);
});



app.post("/meow", async (req, res) => {
    const data = {
        user: Call(Fn("getUser", "test_user")),
        text: "Guten Tag!",
      };
  const doc = await client.query(Create(Collection("meows"), { data }));
  res.send(doc)
});



app.post("/relationship", async (req, res) => {
    const data = {
        follower: Call(Fn("getUser"), 'test_user'),
        followee: Call(Fn("getUser"), 'alice')
    }
    const doc = await client.query(
        Create(
            Collection('relationships'),
            { data }
        )
    )

    res.send(doc)

});


app.get('/feed', async(req, res) => {
    const docs = await client.query(
        Paginate(
            Join(
                Match(
                    Index('followees_by_follower'),
                    Call(Fn("getUser"), 'alice')
                ),
                Index('meows_by_user'),

            )
        )
    )

    res.send(docs)
})