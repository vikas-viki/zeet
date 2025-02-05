import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { RoomUser } from '../types/StateTypes';

const User: React.FC<RoomUser> = (user) => {


    return (
        <div className={`space_room_user_container ${user.videoPaused && "room_user_bg"}`} title={user.userName}>
            <video id={user.userName + "_video"} className='sapce_room_user_video' autoPlay playsInline></video>
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