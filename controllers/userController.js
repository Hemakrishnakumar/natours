const fs = require('fs');

const filePath = `${__dirname}/../dev-data/data/users.json`;
const users = JSON.parse(fs.readFileSync(filePath));

exports.getAllUsers = (req, res) => {
  res.status(200).json({ status: 'successfull', data: users });
};

exports.updateUser = (req, res) => {
  const id = +req.params.id;
  const data = req.body;
  const newUsers = tours.map((user) => (user._id === id ? data : user));
  fs.writeFile(filePath, JSON.stringify(newUsers), (err) => {
    res.status(201).json({ status: 'success', data: newUsers });
  });
};

exports.deleteUser = (req, res) => {
  const id = +req.params.id;
  const newUsers = users.filter((user) => user._id != id);
  if (users.length != newUsers.length) {
    fs.writeFile(filePath, JSON.stringify(newUsers), (err) => {
      res.status(200).json({ status: 'Deleted successfully' });
    });
  } else res.status(204).send('Invalid Id');
};

exports.createUser = (req, res) => {
  const data = req.body;
  const newId = users[users.length - 1]._id + '1';
  const newUser = { _id: newId, ...data };
  users.push(newUser);
  fs.writeFile(filePath, JSON.stringify(users), (err) => {
    res.status(201).json({ status: 'success', data: newUser });
  });
};

exports.getUser = (req, res) => {
  const id = +req.params.id;
  const user = users.find((user) => user._id === id);
  if (user) res.status(200).json({ status: 'successfull', data: user });
  else res.status(404).send('User not found 😥');
};
