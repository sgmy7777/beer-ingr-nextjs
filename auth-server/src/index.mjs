import express, { json } from "express";
import bcrypt from "bcrypt";
import { v6 as uuidv6 } from "uuid";
import cors from "cors";
import { JSONFilePreset  } from "lowdb/node";
import getUser from "./data/helpers/users/get-user.mjs";
import getSession from "./request/helpers/get-session.mjs";
import sessionIsActive from "./request/helpers/session-is-active.mjs";

const port = process.env.PORT ?? 5391;
const saltRounds = 10;
const TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7 * 2;

const app = express();
app.use(json());
app.use(cors());

const db = await JSONFilePreset(`${process.env.DATABASE_NAME ?? "users"}.json`, {
  users: [],
  sessions: [],
  cart: [],
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/signin", async (req, res) => {
  const user = getUser(db, req.body.username);

  if (user === undefined) {
    return res.sendStatus(404);
  }

  const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

  if (!isPasswordCorrect) {
    return res.sendStatus(401);
  }

  const newSession = {
    id: uuidv6(),
    token: `${Math.random()}`,
    expirationDate: Date.now() + TOKEN_EXPIRATION,
    status: "active",
    userId: user.id,
  };

  await db.update(({ sessions }) => sessions.push(newSession));

  const { token, expirationDate } = newSession;

  res.status(200).send({
    token, expirationDate,
  });
});

app.post("/signup", async (req, res) => {
  const user = getUser(db, req.body.username);

  if (user !== undefined) {
    return res.redirect(307, "/signin");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  await db.update(({ users }) => users.push({
    id: uuidv6(),
    username: req.body.username,
    password: hashedPassword,
  }));

  res.sendStatus(201);
});

app.post("/validate-session", async (req, res) => {
  const session = getSession(req, db);
  const currentSessionIsActive = sessionIsActive(session);
  return res.sendStatus(currentSessionIsActive ? 200 : 401);
});

app.post("/add-to-cart", async (req, res) => {
  const session = getSession(req, db);
  const currentSessionIsActive = sessionIsActive(session);

  if (!currentSessionIsActive) {
    return res.sendStatus(403);
  }

  await db.update(({ cart }) => cart.push({
    productID: req.body.productID,
    userID: session.userId,
  }));

  res.sendStatus(200);
});

app.post("/signout", async (req, res) => {
  const session = getSession(req, db);

  if (session === null) {
    return res.sendStatus(401);
  }

  await db.update(({ sessions }) => {
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index === -1) {
      return;
    }

    sessions[index] = {
      ...sessions[index],
      status: "ended",
    };
  });

  res.sendStatus(200);
});

app.get("/cart", async (req, res) => {
  const session = getSession(req, db);
  const currentSessionIsActive = sessionIsActive(session);

  if (!currentSessionIsActive) {
    return res.sendStatus(403);
  }

  const itemsForUser = db.data.cart.filter((item) => item.userID === session.userId);

  const aggregated = itemsForUser.reduce((acc, item) => {
    if (!acc[item.productID]) {
      acc[item.productID] = {
        id: item.productID,
        amount: 0,
      };
    }

    acc[item.productID].amount += 1;

    return acc;
  }, {});

  res.status(200).send(Object.values(aggregated));
});

app.post("/cart/remove-one", async (req, res) => {
  const session = getSession(req, db);
  const currentSessionIsActive = sessionIsActive(session);

  if (!currentSessionIsActive) {
    return res.sendStatus(403);
  }

  const { productID } = req.body;

  if (!productID) {
    return res.sendStatus(400);
  }

  await db.update(({ cart }) => {
    const index = cart.findIndex(
      (item) => item.userID === session.userId && item.productID === productID,
    );

    if (index !== -1) {
      cart.splice(index, 1);
    }
  });

  res.sendStatus(200);
});

app.post("/cart/remove-all", async (req, res) => {
  const session = getSession(req, db);
  const currentSessionIsActive = sessionIsActive(session);

  if (!currentSessionIsActive) {
    return res.sendStatus(403);
  }

  const { productID } = req.body;

  if (!productID) {
    return res.sendStatus(400);
  }

  await db.update(({ cart }) => {
    for (let i = cart.length - 1; i >= 0; i -= 1) {
      if (cart[i].userID === session.userId && cart[i].productID === productID) {
        cart.splice(i, 1);
      }
    }
  });

  res.sendStatus(200);
});

app.post("/cart/clear", async (req, res) => {
  const session = getSession(req, db);
  const currentSessionIsActive = sessionIsActive(session);

  if (!currentSessionIsActive) {
    return res.sendStatus(403);
  }

  await db.update(({ cart }) => {
    for (let i = cart.length - 1; i >= 0; i -= 1) {
      if (cart[i].userID === session.userId) {
        cart.splice(i, 1);
      }
    }
  });

  res.sendStatus(200);
});

const init = async () => {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}

init();
