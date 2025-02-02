import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { RoomUser } from '../types/StateTypes';
import { useState } from 'react';
import { useSocketContext } from '../context/Contexts';

const User: React.FC<RoomUser> = (user) => {
    const [micOn, setMicOn] = useState(false);
    const [videoOn, setVideoOn] = useState(false);

    // const { startConsumingMedia, stopConsumingMedia } = useSocketContext();

    const handleMicOn = () => {
        setMicOn((prev: any) => !prev);
        // startConsumingMedia('audio');
    }
    const handleMicOff = () => {
        // stopConsumingMedia('audio');
        setMicOn((prev: any) => !prev);
    }

    const handleVideoOn = () => {
        // startConsumingMedia('video');
        setVideoOn((prev: any) => !prev);
    }

    const handleVideoOff = () => {
        // stopConsumingMedia('video');
        setVideoOn((prev: any) => !prev);
    }



    return (
        <div className='space_room_user_container'>
            <span title={user.userName} className="space_room_user" style={{ backgroundColor: `rgb(${user.color})` }}>{user.userName.slice(0, 1).toUpperCase()}</span>
            <div className='space_room_user_controls'>
                {
                    !user.audioPaused ?
                        <Mic stroke='#fff' size={12} strokeWidth={1.1} className={`border-left icon_on`} onClick={handleMicOn} />
                        :
                        <MicOff stroke='#fff' size={12} strokeWidth={1.1} className={`border-left icon_off`} onClick={handleMicOff} />
                }
                {
                    !user.videoPaused ?
                        <Video stroke='#fff' size={12} strokeWidth={1.1} className={`border-right icon_on`} onClick={handleVideoOn} />
                        :
                        <VideoOff stroke='#fff' size={12} strokeWidth={1.1} className={`border-right icon_off`} onClick={handleVideoOff} />
                }
            </div>
        </div>
    )
}

export default User;