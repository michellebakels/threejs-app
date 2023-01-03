import {useLayoutEffect, useRef, Suspense} from "react";
import * as THREE from 'three';
import Yellowtail from "../public/Yellowtail_Regular.json"
import { extend, useLoader, render, events } from "@react-three/fiber";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { Physics, useBox } from '@react-three/cannon';

extend({ TextGeometry })
const words = ['Miami'];

const MARGIN = 6;
const TOTAL_MASS = 1;
const FORCE = 25;
const OFFSET = words.length * MARGIN * 0.5;

const Letter = ({ letter, index, letterOff, mass, fontSettings }) => {
    const [ref, api] = useBox(() => ({
        mass,
        position: [letterOff.current, (words.length - index - 1) * MARGIN - OFFSET, 0],
    }));

    useLayoutEffect(() => {
        const size = new THREE.Box3().setFromObject(ref.current).getSize(new THREE.Vector3());
        letterOff.current += size.x;
    }, [ref, letterOff]);

    return (
        <mesh
            ref={ref}
            onClick={({ face }) => {
                // Get the impulse based on the face normal
                const impulse = face.normal.multiplyScalar(-FORCE).toArray();
                api.applyLocalImpulse(impulse, [0, 0, 0]);
            }}
        >
            <meshPhongMaterial color={0xFF10F0}/>
            <textGeometry args={[letter, fontSettings]} />
        </mesh>
    );
};

const Word = ({ text, index }) => {
    const [ref] = useBox(() => ({
        mass: 0,
        position: [0, index * MARGIN - OFFSET, 0],
        args: [50, 0.1, 50],
    }));
    const mass = TOTAL_MASS / text.length;
    const font = useLoader(FontLoader, '/Yellowtail_Regular.json');
    const fontSettings = {
        font,
        size: 3,
        height: 0.4,
        curveSegments: 24,
        bevelEnabled: true,
        bevelThickness: 0.9,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 10,
    };

    const letterOff = useRef(0);

    return (
        <group>
            {text.split('').map((letter, i) => (
                <Letter
                    key={`letter-${i}`}
                    letter={letter}
                    index={index}
                    letterOff={letterOff}
                    mass={mass}
                    fontSettings={fontSettings}
                />
            ))}
            <mesh ref={ref} visible={false}>
                <boxGeometry args={[50, 0.1, 50]} />
                <meshBasicMaterial />
            </mesh>
        </group>
    );
};

function HeroText() {
    // const font = new FontLoader().parse(Yellowtail);

    return(
        <>
            <ambientLight color={0xcccccc} />
            <directionalLight intensity={0.5} position={[5, 5, 20]} />
            <directionalLight position={[-5, -5, -10]} />
            <fog args={[0x202533, 1, 100]} attach="fog" />
            <Physics gravity={[0, -50, 0]}>
                <Suspense fallback={null}>
                    {words.map((word, index) => (
                        <Word key={`word-${index}`} text={word} index={index} />
                    ))}
                </Suspense>
            </Physics>
            {/*<mesh>*/}
                {/*<textGeometry args={['React Miami', {font, size: 2, height: 0}]}/>*/}
                {/*<meshStandardMaterial attach='material' color={0xFF10F0}/>*/}
            {/*</mesh>*/}
        </>
    )
}

export default HeroText