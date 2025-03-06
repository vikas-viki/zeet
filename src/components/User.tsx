import { Maximize, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { RoomUser } from '../types/StateTypes';
import React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import "react-resizable/css/styles.css";

const User: React.FC<RoomUser> = (user) => {
    const [fullScreenPlaying, setFullScreenPlaying] = React.useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [maximised, setMaximised] = React.useState(false);

    const handleVideoExpand = () => {
        setFullScreenPlaying(prev => {
            // if (!prev) {
            // videoRef.current!.requestPictureInPicture();
            // }
            return !prev;
        });
        setMaximised(true);
    };

    // React.useEffect(() => {
    //     const video = document.getElementById(user.userName + "_video") as HTMLVideoElement;

    //     if (video) {
    //         video.addEventListener("leavepictureinpicture", () => {
    //             setFullScreenPlaying(false);
    //         });
    //     }

    //     return () => {
    //         if (video) {
    //             video.removeEventListener("leavepictureinpicture", () => {
    //                 setFullScreenPlaying(false);
    //             });
    //         }
    //     };
    // }, []);

    return (
        <div className={`space_room_user_container ${(user.videoPaused || fullScreenPlaying) && "room_user_bg"}`} title={user.userName}>
            <div className={`${maximised == true ? "video_maximised" : "video_minimised"}`}>
                <Draggable>
                    <ResizableBox width={200} height={200} minConstraints={[160, 90]} maxConstraints={[640, 360]} resizeHandles={['se']}>
                        <video ref={videoRef} id={user.userName + "_video"} className={`sapce_room_user_video`} autoPlay playsInline></video>
                    </ResizableBox>
                </Draggable>
            </div>
            <audio id={user.userName + "_audio"} className={`sapce_room_user_audio`} autoPlay playsInline></audio>
            {!user.videoPaused && !fullScreenPlaying &&
                <Maximize className="user_video_full_screen" size={25} onClick={handleVideoExpand} />
            }
            <span className="space_room_user" style={{ backgroundColor: `rgb(${user.color})` }}>{user.userName.slice(0, 1).toUpperCase()}</span>
            <div className='space_room_user_controls'>
                {
                    !user.audioPaused ?
                        <Mic stroke='#fff' size={12} strokeWidth={1.1} className={`border-left icon_on`} />
                        :
                        <MicOff stroke='#fff' size={12} strokeWidth={1.1} className={`border-left icon_off`} />
                }
                {
                    !user.videoPaused ?
                        <Video stroke='#fff' size={12} strokeWidth={1.1} className={`border-right icon_on`} />
                        :
                        <VideoOff stroke='#fff' size={12} strokeWidth={1.1} className={`border-right icon_off`} />
                }
            </div>
        </div>
    )
}

export default User;