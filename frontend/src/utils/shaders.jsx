export const shaders = {};

shaders.utils = 
`
uniform float   u_time;
uniform vec3    u_color;
uniform int     u_palette;
uniform vec2    u_resolution;
uniform mat4    projectionMatrix;
varying vec3    pos;

vec3 palette(float t, int mode)
{
    vec3 a = vec3(0.);
    vec3 b = vec3(0.);
    vec3 c = vec3(0.);
    vec3 d = vec3(0.);
    if (mode == 1)
    {
        a = vec3(0.5, 0.5, 0.5);
        b = vec3(0.5, 0.5, 0.5);
        c = vec3(1.0, 1.0, 1.0);
        d = vec3(0.25, 0.4, 0.55);
    }
    else if (mode == 2)
    {
        a = vec3(0.408, 0.378, 0.358);
        b = vec3(-0.472, -0.472, 0.318);
        c = vec3(0.898, 1.328, 0.498);
        d = vec3(2.088, 0.718, 0.667);
    }
    else if (mode == 3)
    {
        a = vec3(0.588, 0.498, 0.588);
        b = vec3(-0.472, -0.472, 0.318);
        c = vec3(0.408, 1.638, 0.268);
        d = vec3(2.088, 1.238, 1.008);
    }
    else if (mode == 4)
    {
        a = vec3(0., 0.538, 0.288);
        b = vec3(0., -0.362, 0.668);
        c = vec3(0., 0.318, 0.248);
        d = vec3(0., 0.198, 0.698);
    }
    return abs(a + b * cos(6.28 * (c*t+d))); 
}

vec2 randomVec(vec2 gridCorner)
{
    float x = dot(gridCorner, vec2(412., 198.));
    float y = dot(gridCorner, vec2(276., 332.));
    vec2 gradient = vec2(x ,y);
    gradient = sin(gradient);
    gradient = cos(gradient * 672. + u_time / 2000.);
    return gradient;
}

float quintic( float x )
{ return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }

float perlinNoise(vec2 uv, int mode)
{
    vec2 gridId = floor(uv);
    vec2 gridVec = fract(uv);
    
    vec2 bl = gridId + vec2(0.0, 0.0);
    vec2 br = gridId + vec2(1.0, 0.0);
    vec2 tl = gridId + vec2(0.0, 1.0);
    vec2 tr = gridId + vec2(1.0, 1.0);
    
    vec2 distPixBl = gridVec - vec2(0.0, 0.0);
    vec2 distPixBr = gridVec - vec2(1.0, 0.0);
    vec2 distPixTl = gridVec - vec2(0.0, 1.0);
    vec2 distPixTr = gridVec - vec2(1.0, 1.0);
    
    vec2 gradBl = randomVec(bl);
    vec2 gradBr = randomVec(br);
    vec2 gradTl = randomVec(tl);
    vec2 gradTr = randomVec(tr);
    
    float dotBl = dot(gradBl, distPixBl);
    float dotBr = dot(gradBr, distPixBr);
    float dotTl = dot(gradTl, distPixTl);
    float dotTr = dot(gradTr, distPixTr);
    
    if (mode == 0)
        gridVec = vec2(quintic(gridVec.x), quintic(gridVec.y));
    else
    {
        gridVec *= smoothstep(0.0, 0.5, gridVec);
        gridVec = 0.005 / gridVec;
    }
    
    float b = mix(dotBl, dotBr, gridVec.x);
    float t = mix(dotTl, dotTr, gridVec.x);
    float perlin = mix(b, t, gridVec.y) + 0.3;
    
    return perlin;
}

float ibotNoise(vec2 uv)
{
    uv += u_time / 10000.;
    vec2 gridId = floor(uv);
    vec2 gridVec = fract(uv);
    
    vec2 bl = gridId + vec2(0.0, 0.0);
    vec2 br = gridId + vec2(1.0, 0.0);
    vec2 tl = gridId + vec2(0.0, 1.0);
    vec2 tr = gridId + vec2(1.0, 1.0);
    
    vec2 gradBl = randomVec(bl);
    vec2 gradBr = randomVec(br);
    vec2 gradTl = randomVec(tl);
    vec2 gradTr = randomVec(tr);
    
    gridVec = vec2(quintic(gridVec.x), quintic(gridVec.y));
    
    float xBot = mix(gradBl.x, gradBr.x, gridVec.x);
    float yBot = mix(gradBl.y, gradBr.y, gridVec.x);
    float xTop = mix(gradTl.x, gradTr.x, gridVec.x);
    float yTop = mix(gradTl.y, gradTr.y, gridVec.x);
    float x = mix(xBot, xTop, gridVec.y);
    float y = mix(yBot, yTop, gridVec.y);
    vec2 colVec = vec2(x, y);
    
    float ibot = x + y + x * x + y * y;
    return ibot;
}

float fbmPerlinNoise(vec2 uv, int mode)
{
float fbmNoise = 0.0;
float amplitude = 1.0;
const int octaves = 1;

for (int i = 0; i < octaves; i++)
    {
        fbmNoise += perlinNoise(uv, mode) * amplitude;
        amplitude *= 0.5;
        uv *= 2.0;
    }
    return fbmNoise;
}

float domainWarpNoise(vec2 uv, int mode)
{
    float fbm1 = fbmPerlinNoise(uv + vec2(3.2, 2.6), mode);
    float fbm2 = fbmPerlinNoise(uv + vec2(2.1, 4.3), mode);
    
    // float fbm3 = fbmPerlinNoise(vec2(fbm1, fbm2) + vec2(3.1, 2.5), mode);
    // float fbm4 = fbmPerlinNoise(vec2(fbm1, fbm2) + vec2(0.6, 2.3), mode);
    
    return fbmPerlinNoise(vec2(fbm1, fbm2), mode);
}

vec3 calcNormal(vec2 uv, int mode)
{
    float diff = 0.001;
    float p1 = domainWarpNoise(uv + vec2(diff, 0.0), mode);
    float p2 = domainWarpNoise(uv - vec2(diff, 0.0), mode);
    float p3 = domainWarpNoise(uv + vec2(0.0, diff), mode);
    float p4 = domainWarpNoise(uv - vec2(0.0, diff), mode);
    
    vec3 normal = normalize(vec3(p1 - p2, p3 - p4, diff));
    return normal;
}

vec3 diffuseLighting(vec3 normal, vec3 lightColor)
{
    vec3 lightSource = vec3(1., 1., 1.);
    float diffuseStrength = max(0., dot(lightSource, normal));
    vec3 diffuse = diffuseStrength * lightColor;
    
    return diffuse;
}

vec3 specularLighting(vec3 normal, vec3 lightColor)
{
    vec3 lightSource = vec3(1., 1., 1.);
    vec3 cameraSource = vec3(0., 0., 1.);
    vec3 viewSource = normalize(cameraSource);
    vec3 reflectSource = normalize(reflect(-lightSource, normal));
    float specularStrength = max(0.0, dot(viewSource, reflectSource));
    specularStrength = pow(specularStrength, 20.);
    vec3 specular = specularStrength * lightColor;
    
    return specular;
}
`

const main_init = 
`
void main()
{
    // BORING COORDINATES STUFF
    vec2 ndc = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    vec4 clipSpacePos = vec4(ndc, gl_FragCoord.z, 1.0);
    vec4 viewSpacePos = inverse(projectionMatrix) * clipSpacePos;
    vec4 worldSpacePos = inverse(viewMatrix) * viewSpacePos;
    vec2 pos = worldSpacePos.xy;
`
    
shaders.background_default = main_init +
`
    pos *= 4.;
    vec3 color = u_color;
    
    float noiseValue = ibotNoise(pos);
    if (u_palette != 0)
        color = palette(noiseValue / 4. + u_time / 10000., u_palette);
    
    if (noiseValue > 0.4)
        noiseValue *= 1.3;
    if (noiseValue > 0.7)
        noiseValue *= 1.3;
    if (noiseValue > 0.9)
        noiseValue *= 0.5;
    if (noiseValue > 0.8)
        noiseValue *= 0.3;
    color *= noiseValue;
    gl_FragColor = vec4(color, 1.0);
}
`

shaders.background_lightsquares = main_init + 
`
    pos *= 4.;
    vec3 color = u_color;
    if (u_palette != 0)
        color = palette(floor(pos).x / 20. + u_time / 10000., u_palette);

    float noiseValue = 0.0;
    noiseValue = perlinNoise(pos, 1) / 2.;

    color *= noiseValue;
    gl_FragColor = vec4(color, 1.0);
}
`

shaders.background_waves = main_init + 
`
    pos *= 4.;
    vec3 color = u_color;
    if (u_palette != 0)
        color = palette(pos.x / 25. + u_time / 10000., u_palette);

    vec3 normal = calcNormal(pos, 0);
    vec3 lighting = diffuseLighting(normal, color) * 0.5;
    lighting += specularLighting(normal, color) * 0.5;

    gl_FragColor = vec4(lighting, 1.0);
}
`

shaders.background_fractcircles = main_init +
`
    vec3 color = u_color;
    vec2 pos0 = pos;
    if (u_palette != 0)
        color = palette(length(pos0) + u_time / 1000., u_palette) / 2.;

    pos = fract(pos * 2.) - 0.5;
    float d = abs(sin(length(pos) * 8. + u_time / 1000.) / 8.);
    d = 0.02 / d;
    color *= d;
        
    gl_FragColor = vec4(color, 1.0);
}
`

shaders.background_skybox = "skybox"

// POWER-UPS SHADERS

shaders.pu_vs = 
`
uniform float u_time;
varying vec3    pos;

vec3 mod289(vec3 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
    return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec3 P)
{
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
}

void main()
{
    vec3 displacement = normal * cnoise(position + u_time / 2000.) / 1.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + displacement, 1.);
    pos = position + displacement * 1.5;
}
`

shaders.pu_fs =
`
uniform float u_time;
uniform float u_radius;
uniform float u_spawn;
uniform float u_fade;
uniform vec3 u_color;
varying vec3 pos;

void main()
{
    vec3 color = u_color;
    float len = length(pos);
    float alpha = min(1., 1. / (len * len * len / (u_radius / 4.)) + 0.5);
    if (u_spawn > -0.1)
        alpha *= u_spawn / 1000.;
    else if (u_fade > 1.)
        alpha *= max(0.1, abs(cos(u_fade / (300. - u_fade /40.))));
    gl_FragColor = vec4(color, alpha);
}
`