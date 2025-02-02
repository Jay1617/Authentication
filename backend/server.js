import app  from "./app.js";

const port = process.env.PORT || 5500;

app.listen(port, () => {
  console.log(`Server started successfully at PORT: ${port}`);
});

