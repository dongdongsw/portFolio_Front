import {Route,Routes} from 'react-router-dom';
import Home from './main/home';
import Login from './user/login/login';
import Postlist from './post/post_list/postlist';
import PostDetail from './post/post_detail/postdetail';
import PostCreate from './post/create/postcreate';
import PostUpdate from './post/update/postupdate';
import Comment from './comment/comment';
import Mypage from './mypage/mypage';
import ContactUs from './contactus/contactus';
import AboutMe from './aboutme/aboutme';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/postlist' element={<Postlist/>} />
      <Route path='/postlist/postdetail/:id' element={<PostDetail/>} />
      <Route path='/create' element={<PostCreate/>}/>
      <Route path='/update/:id' element={<PostUpdate/>}/>
      <Route path='/comment' element={<Comment/>}/>
      <Route path='/mypage' element={<Mypage/>}/>
      <Route path='/contactus' element={<ContactUs/>}/>
      <Route path='/aboutme' element={<AboutMe/>}/>

      

    </Routes>

  );
}

export default App;
