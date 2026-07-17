export function hRed(st, a) {
  switch(a.type) {
    case "PUSH":  return { past:[...st.past,st.present].slice(-MAX_H), present:a.p, future:[] };
    case "UNDO":  return st.past.length===0 ? st : { past:st.past.slice(0,-1), present:st.past[st.past.length-1], future:[st.present,...st.future] };
    case "REDO":  return st.future.length===0 ? st : { past:[...st.past,st.present], present:st.future[0], future:st.future.slice(1) };
    case "RESET": return { past:[], present:a.p, future:[] };
    default: return st;
  }
}
