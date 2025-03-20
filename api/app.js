const logger = require ('./util/logger');
const express = require ('express');

const app = express ();

app.listen (3030, () => {
  return logger.info ('Server running in port 3030');
});
