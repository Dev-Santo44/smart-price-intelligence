import React from 'react'
interface User{
    id:number;
    name: string;
}
const UserPage = async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    const users: User[] = await res.json();
    
    return (
        <div>
            <main>UserPage</main>
            
            <ul>{users.map(user=><li key = {user.id}>{user.name}</li>)}</ul>
        </div>
    )
}

export default UserPage
