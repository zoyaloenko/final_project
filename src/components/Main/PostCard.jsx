import { useContext, useEffect, useReducer, useState } from "react"
import { AuthContext } from "../AppContext/AppContext";
import { PostReducer, postActions, postsStates } from "../AppContext/PostReducer";
import { doc, setDoc, collection, serverTimestamp, orderBy, query, onSnapshot, where, getDocs, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { avatar, Avatar } from "@material-tailwind/react";
import addFriend from "../../assets/images/add-friend.png";
import like from "../../assets/images/like.png";
import CommentSection from "./CommentSection";
import comment from "../../assets/images/comment.png";
import remove from "../../assets/images/delete.png";







const PostCard = ({ uid, id, logo, name, email, text, image, timestamp }) => {
    const { user } = useContext(AuthContext);
    const [state, dispatch] = useReducer(PostReducer, postsStates);
    const [open, setOpen] = useState(false);
    const singlePostDocument = doc(db, "posts", id);
 
    const likesRef = doc(collection(db, "posts", id, "likes"));
    const likesCollection = collection(db, "posts", id, "likes");

    const { ADD_LIKE, HANDLE_ERROR } = postActions;

    const handleOpen = (e) => {
        e.preventDefault();
        setOpen(true);
    }

    const addUser = async () => {
        try {
            const q = query(collection(db, "users"), where("uid", "==", user?.uid));
            const doc = await getDocs(q);
            const data = doc.docs[0].ref;
            await updateDoc(data, {
                friends: arrayUnion({
                    id: uid,
                    image: logo,
                    name: name
                })
            })
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleLike = async (e) => {
        e.preventDefault();
        const q = query(likesCollection, where("id", "==", user?.uid));
        const querySnapshot = await getDocs(q);
        const likesDocId = await querySnapshot?.docs[0]?.id;

        try {
            if(likesDocId !== undefined) {
                const deleteId = doc(db, "posts", id, "likes", likesDocId);
                await deleteDoc(deleteId);
            } else {
                await setDoc(likesRef, {
                    id: user?.uid
                })
            }
            
        } catch (error) {
            console.log(error.message)
            
        }
    }

    const deletePost = async (e) => {
        e.preventDefault();
        try {
          if (user?.uid === uid) {
            await deleteDoc(singlePostDocument);
          } else {
            alert("You cant delete other users posts !!!");
          }
        } catch (err) {
          alert(err.message);
          console.log(err.message);
        }
      };
    

    useEffect(() => {
        const getLikes = async () => {
            try {
                const q = collection(db, "posts", id, "likes");
                await onSnapshot(q, (doc) => {
                    dispatch({
                        type: ADD_LIKE,
                        likes: doc.docs.map((item) => item.data())
                    })
                })
                
            } catch (error) {
                dispatch({ type: HANDLE_ERROR })
                console.log(error.message)
            }
        };
        return () => getLikes();
    }, [id, ADD_LIKE, HANDLE_ERROR])

  return (
    <>
    <div className="mb-4">
        <div className="flex flex-col py-4 bg-white rounded-t-3x1">
            <div className="flex items-center pb-4 ml-2">
                <Avatar 
                    size="sm"
                    variant="circular"
                    src={logo || avatar}
                    alt="avatar"/>
                <div className="flex flex-col ml-4">
            <p className=" py-2 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
              {/* {email} */}
              {user?.displayName}
            </p>
            <p className=" font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
              Published: {timestamp}
            </p>
          </div>
          {user?.uid !== uid && (
            <div
              onClick={addUser}
              className="w-full flex justify-end cursor-pointer mr-10"
            >
              <img
                className="hover:bg-blue-100 rounded-xl p-2"
                src={addFriend}
                alt="addFriend"
              ></img>
            </div>
          )}
            </div>
            <div>
          <p className="ml-4 pb-4 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
            {text}
          </p>
          {image && (
            <img className="h-[500px] w-full" src={image} alt="postImage"></img>
          )}
        </div>
        <div className="flex justify-around items-center pt-4">
          <button
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            onClick={handleLike}
          >
            <img className="h-8 mr-4" src={like} alt=""></img>
            {state.likes?.length > 0 && state?.likes?.length}
          </button>
          <div
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            onClick={handleOpen}
          >
            <div className="flex items-center cursor-pointer">
              <img className="h-8 mr-4" src={comment} alt="comment"></img>
              <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
                Comments
              </p>
            </div>
          </div>
          <div
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            onClick={deletePost}
          >
            <img className="h-8 mr-4" src={remove} alt="delete"></img>
            <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
              Delete
            </p>
          </div>
        </div>
        {open && <CommentSection postId={id} />}
      </div>
        
        {/* </div> */}
    </div>
    {/* <div>
        <p>{name}</p>
        <p>Published {timestamp}</p>
        <div>Add Friend</div>
        <p>{text}</p>
        {image && <img src={image} alt="postImage"/>}
        <button>Like</button>
        <p>Display likes</p>
        <button>Comment</button>
        <p>comments</p>
        <button>Delete</button>
    </div> */}
    </>
  )
}

export default PostCard;