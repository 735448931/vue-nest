import mitt from 'mitt';

interface Events {
    
}

const emitter = mitt<Events>();

export default emitter;