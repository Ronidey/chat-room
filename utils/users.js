const users = [];

exports.addUser = ({ id, username, room }) => {
  const user = {
    id: id,
    username: username.trim().toLowerCase(),
    room: room.trim().toLowerCase()
  };

  users.push(user);
  return user;
};

exports.removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

exports.getUser = (id) => {
  return users.find((user) => user.id === id);
};

exports.getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};
