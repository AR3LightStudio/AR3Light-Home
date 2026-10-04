import * as THREE from './vendor/three.module.js';
// A textured volume impression: independent advection and UV deformation per depth layer.
export function createFog(onReady,target){
 const canvas=target||document.createElement('canvas');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.setPixelRatio(1);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const uniforms={mist:{value:null},time:{value:0},view:{value:new THREE.Vector2(1,1)},art:{value:new THREE.Vector4(0,0,1,1)}};
 const material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,uniforms,
 vertexShader:`varying vec2 uvScreen;void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.,1.);}`,
 fragmentShader:`precision highp float;varying vec2 uvScreen;uniform sampler2D mist;uniform float time;uniform vec2 view;uniform vec4 art;
 float cloud(vec2 p,vec2 center,vec2 size,float seed){
  vec2 uv=(p-center)/size+.5;
  uv+=vec2(sin(uv.y*10.+time*.20+seed)+sin(uv.y*21.-time*.13+seed)*.3,sin(uv.x*9.-time*.24+seed)+sin(uv.x*18.+time*.17)*.35)*.012;
  float edge=smoothstep(0.,.07,uv.x)*smoothstep(0.,.07,1.-uv.x)*smoothstep(0.,.06,uv.y)*smoothstep(0.,.06,1.-uv.y);
  vec4 tex=texture2D(mist,vec2(clamp(uv.x,0.,1.),1.-clamp(uv.y,0.,1.)));
  float l=dot(tex.rgb,vec3(.3,.5,.2));
  vec2 tc=vec2(clamp(uv.x,0.,1.),1.-clamp(uv.y,0.,1.));
  vec4 a1=texture2D(mist,tc+vec2(.009,0.)),a2=texture2D(mist,tc-vec2(.009,0.)),a3=texture2D(mist,tc+vec2(0.,.014)),a4=texture2D(mist,tc-vec2(0.,.014));
  float b=(dot(a1.rgb,vec3(.3,.5,.2))*a1.a+dot(a2.rgb,vec3(.3,.5,.2))*a2.a+dot(a3.rgb,vec3(.3,.5,.2))*a3.a+dot(a4.rgb,vec3(.3,.5,.2))*a4.a)*.25;
  float value=l*tex.a;
  float filament=max(value-b*.97,0.);
  return (value*.32+filament*1.8)*edge;
 }
 void main(){
  vec2 pixel=vec2(uvScreen.x,1.-uvScreen.y)*view;
  vec2 p=(pixel-art.xy)/art.zw;
  float back=0.;
  for(int i=0;i<3;i++){
   float j=float(i),u=fract(time*(.007+j*.0015)+j*.34+.12);
   float x=mix(-.42,1.42,u);if(i==1)x=1.-x;
   float y=.14+j*.19+sin(time*.12+j)*.018;
   back+=cloud(p,vec2(x,y),vec2(.72,.39),j*2.1)*(.65+.20*sin(time*.14+j))*smoothstep(0.,.12,u)*smoothstep(0.,.12,1.-u);
  }
  float guard=exp(-pow((p.x-.515)/.19,4.)-pow((p.y-.59)/.23,4.));
  back*=1.-guard*.8;
  float front=0.;
  for(int i=0;i<2;i++){
   float j=float(i),u=fract(time*(.011+j*.003)+j*.53+.20);
   float x=i==0?mix(-.5,1.5,u):mix(1.5,-.5,u);
   front+=cloud(p,vec2(x,.75+j*.12+sin(time*.14+j)*.014),vec2(.86,.34),4.+j)*.70*smoothstep(0.,.12,u)*smoothstep(0.,.12,1.-u);
  }
  // Dissolve the moving foreground before it reaches the bowl or flame.
  front*=1.-guard*.75;
  float plume=cloud(p,vec2(.505+sin(time*.18)*.014,.32),vec2(.19,.35),8.)*.32;
  float bounds=smoothstep(-.02,.05,p.y)*smoothstep(-.03,.05,1.-p.y);
  // Preserve wispy gaps while making the compact curls read as denser passing banks.
  float raw=(back+front+plume)*bounds;
  float density=clamp(raw*(.88+smoothstep(.12,.48,raw)*.14),0.,.72);
  gl_FragColor=vec4(mix(vec3(.69,.72,.70),vec3(.96,.96,.94),clamp(density*.85,0.,1.)),density);
 }`});
 scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
 let ready=false;
 new THREE.TextureLoader().load('assets/mist-filaments-v1.png',texture=>{texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;uniforms.mist.value=texture;ready=true;onReady();},undefined,()=>{document.querySelector('#motion').textContent='烟雾素材加载失败';});
 return{resize(width,height,art){const scale=Math.min(.85,1280/width);renderer.setSize(Math.max(1,Math.round(width*scale)),Math.max(1,Math.round(height*scale)),false);uniforms.view.value.set(width,height);uniforms.art.value.set(art.x,art.y,art.width,art.height);},render(t){if(!ready)return null;uniforms.time.value=t;renderer.render(scene,camera);return canvas;}};
}
