import React, { useEffect } from "react";
import { useSelector } from "react-redux";

function Home() {
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // console.log(currentUser);
  });

  return <div>Home</div>;
}

export default Home;
