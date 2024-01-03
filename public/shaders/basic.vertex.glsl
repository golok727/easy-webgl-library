#version 300 es
layout (location = 0) in vec2 vPosition;
layout (location = 1) in vec3 vColor; 

out vec3 color;
void main()
{
  color = vColor;
  gl_Position = vec4(vPosition, 0.0, 1.0);
}