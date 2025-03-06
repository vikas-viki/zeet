import { Maximize, Mic, MicOff, Video, VideoOff, X } from 'lucide-react';
import { RoomUser } from '../types/StateTypes';
import React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import "react-resizable/css/styles.css";

const User: React.FC<RoomUser> = (user) => {
    const [fullScreenPlaying, setFullScreenPlaying] = React.useState(false);
    const [maximised, setMaximised] = React.useState(false);

    const handleVideoExpand = () => {
        setFullScreenPlaying(prev => {
            return !prev;
        });
        setMaximised(true);
    };

    const minimizeVideo = () => {
        setMaximised(false);
        setFullScreenPlaying(false);
    }

    return (
        <div className={`space_room_user_container room_user_bg`} title={user.userName}>
            <div className={`${maximised == true ? "video_maximised" : "video_minimised"}`}>
                <Draggable>
                    <ResizableBox width={305} height={200} maxConstraints={[600, 400]} resizeHandles={['se']}>
                        <div>
                            <video id={user.userName + "_video"} className={`sapce_room_user_video`} autoPlay playsInline></video>
                            <button className='close_video' onClick={minimizeVideo}>
                                <X style={{ backgroundColor: "grey", borderRadius: "4px", cursor: "pointer" }} />
                            </button>
                        </div>
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