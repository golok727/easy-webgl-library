#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec3 u_Color;
uniform vec2 u_Resolution;

void main() {
    vec2 uv = (gl_FragCoord.xy / u_Resolution * 2.0 - 1.0) * vec2(u_Resolution.x / u_Resolution.y, 1.0);
    vec2 center = vec2(0.0);

    float radius = 0.5; 
    float dist = radius - length(uv - center);
    float circle = smoothstep(0.0, 0.01, dist);

    fragColor = vec4(u_Color * circle, circle);
}
