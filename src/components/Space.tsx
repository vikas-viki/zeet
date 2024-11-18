import { Application, Loader } from 'pixi.js';
import { useEffect, useRef } from 'react';

const Space = () => {

    const app = new Application();
    const canvasRef = useRef(null);
    const loader = new Loader();

    app.init({
        width: 600,
        height: 600,
        backgroundColor: 0x1099bb
    }).then(() => {
        if (canvasRef.current && canvasRef.current.hasChildNodes() == false)
            canvasRef.current.appendChild(app.canvas);
    });

    return (
        <div ref={canvasRef}>
        </div>
    )
}

export default Space;