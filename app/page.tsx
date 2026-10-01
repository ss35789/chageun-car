import CarApp from './car-app';
import {chatGPTSignInPath,chatGPTSignOutPath} from './chatgpt-auth';
export default function Home(){return <CarApp signinhref={chatGPTSignInPath('/')} signouthref={chatGPTSignOutPath('/')}/>;}
