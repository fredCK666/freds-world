document.querySelector('#loginForm').addEventListener('submit',event=>{
  event.preventDefault();
  const input=document.querySelector('#password'),error=document.querySelector('#error');
  if(input.value!=='0000'){error.textContent='密碼不正確，請重新輸入。';input.setAttribute('aria-invalid','true');input.focus();input.select();return;}
  try{sessionStorage.setItem('cardflow-demo-access','granted');location.replace('app.html');}
  catch{error.textContent='瀏覽器無法保存登入狀態，請允許網站儲存或使用一般瀏覽模式。';}
});
