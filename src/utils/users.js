const users = []

//add user

const addUser = ({id, username,room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username|| !room){
        return{
            error:'username and room are required'
       }
    }   
       //check for existing user
       const existingUser =users.find((user) => {
           return user.room === room && user.username === username
       })


       //validate username
       if (existingUser) {
           return {
               error:'username is in use '
           }
        }

      //store user
      const user ={id, username, room} 
      users.push(user)
      return { user }

}
//remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1 ) {
        return users.splice(index,1)[0]
    }
}

//get user
const getUser = (id) =>{
    return users.find((user) => user.id ===id)
}


//getUsersInRoom
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


// addUser({
//     id:24,
//     username:'Andrew',
//     room: 'south philly'
// })

// addUser({
//     id:23,
//     username:'suliat',
//     room: 'south philly'
// })

// addUser({
//     id:22,
//     username:'jamiu',
//     room: 'Center City'
// })

// console.log(users)

// const removedUser = removeUser(24)
// console.log(removedUser)
// console.log(users)
 
// const user = getUser(23)
// // console.log(user)

// const userList = getUsersInRoom(' offa')
// console.log(userList)
