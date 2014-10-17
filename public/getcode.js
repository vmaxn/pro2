function getCode() {   
 var days = document.getElementById('days');
 var city = document.getElementById('city')
 var req = ['days=' + days[days.selectedIndex].value, 'city=' + city[city.selectedIndex].value];    
 var rads = document.getElementsByName('align');
 for (i=0; i < rads.length; i++) {
  if (rads[i]['checked']) {
   req.push('align=' + rads[i].value);
   break;
  }
 }  
 document.getElementById("code").value = '<iframe src="http://localhost:3000/get?' + 
  req.join('&') + '" width="100%" height="100%" frameborder="0"></iframe>';
}