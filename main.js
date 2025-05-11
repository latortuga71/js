

// Buffers binary data you upload to gpu, could be any data

// Attributes specify how to pull data out of your buffers and provide them to the vertex shader

// vertex shader executed a number of times, each time the next value from each specified buffer is pulled out and assigned to an attribute

// the state of attributes, which buffers to use for each one and how to pull data from buffers is collected into a vertex array object


// Uniforms are global variables you set before you execute your shader program


// textures are arrays of data you can access in your shader program


// varyings are a way for a vertex shader to pass data into a fragment shader


const vertexShaderSrc = `#version 300 es
in vec4 a_position;
 
void main() {
  gl_Position = a_position;
}
`;

const fragmentShaderSrc = `#version 300 es
    precision highp float;
    uniform vec4 u_color; 
    out vec4 outColor;
     
    void main() {
      outColor = u_color;
    }
`;

var vertexShaderPixelsToClipSpaceSrc = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1); // flip coords so its the top left
}
`;



function compileShader(glCtx,type,source){
    let shader = glCtx.createShader(type);
    glCtx.shaderSource(shader,source);
    glCtx.compileShader(shader);
    let ok = glCtx.getShaderParameter(shader,glCtx.COMPILE_STATUS);
    if (ok){
        return shader;
    }
    console.log("ERROR: Failed to compile shader ", glCtx.getShaderInfoLog(shader));
    glCtx.deleteShader(shader);
}


function createShaderProgram(glCtx,vertShader,fragShader){
    let program = glCtx.createProgram();
    glCtx.attachShader(program,vertShader);
    glCtx.attachShader(program,fragShader);
    glCtx.linkProgram(program);
    let ok = glCtx.getProgramParameter(program,glCtx.LINK_STATUS)
    if (ok){
        return program;
    }
    console.log("ERROR: Failed to link shaders into program ", glCtx.getProgramInfoLog(program));
    glCtx.deleteProgram(program);
}

function randomInt(range){
    return Math.floor(Math.random() * range);
}

function setRect(glCtx, x, y, width, height){
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;

    // copies buffer to the current bound gl.ARRAY_BUFFER
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([
        x1,y1,
        x2,y1,
        x1,y2,
        x1,y2,
        x2,y1,
        x2,y2
    ]),glCtx.STATIC_DRAW);
}

function main(){
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl2");
    const trianglePositions = [
        10,20,
        80,20,
        10,30,
        10,30,
        80,20,
        80,30,
    ]

    let vshader = compileShader(gl,gl.VERTEX_SHADER,vertexShaderPixelsToClipSpaceSrc);
    let fshader = compileShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSrc);
    let shaderProgram = createShaderProgram(gl,vshader,fshader);

    // -- Init the buffer with the vertex data --

    // create buffer that will hold data for a_position
    let positionBuffer = gl.createBuffer();
    // bind it
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    // copy the buffer to the binded GPU ARRAY_BUFFER(positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglePositions), gl.STATIC_DRAW);

    // -- We need to tell attribute how to get the data out of the buffer on the GPU
    let resolutionUniform = gl.getUniformLocation(shaderProgram,"u_resolution");
    let colorUniform = gl.getUniformLocation(shaderProgram,"u_color");
    let positionAttribute = gl.getAttribLocation(shaderProgram, "a_position");
    let vertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObject);
    // turn attribute on
    gl.enableVertexAttribArray(positionAttribute);
    // tell attrib how to get data out of our buffer

    let sz = 2;
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    // the CURRENT gl.ARRAY_BUFFER data is being bound to the attribute
    // this means that we can now bind something else to the ARRAY_BUFFER bindpoint
    // the attribute will continue to use positionBuffer
    gl.vertexAttribPointer(positionAttribute,sz,type,normalize,stride,offset);

    // this converts the coordinates from clipspace to pixel space on our screen
    // clip space has to be between -1.0 and 1.0
    gl.viewport(0,0, gl.canvas.width,gl.canvas.height);

    // clean canvas
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // tell gpu to use our shader program
    gl.useProgram(shaderProgram);
    // set uniforms in our currently loaded program
    gl.uniform2f(resolutionUniform,gl.canvas.width,gl.canvas.height);

    // tell opengl which set of buffers to use and how to pull data out via the vertexArrayObject
    gl.bindVertexArray(vertexArrayObject);

    for (let i = 0; i < 50; i++){
        setRect(gl,randomInt(300),randomInt(300),randomInt(300),randomInt(300));
        gl.uniform4f(colorUniform,Math.random(),Math.random(),Math.random(),1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

    }




}

main();