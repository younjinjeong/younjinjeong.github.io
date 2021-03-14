$(function () {
  // HACK: This should be window.Terminal once upgraded to 4.0.1
  // var term = new window.Terminal.Terminal();
  var term = new Terminal();
  term.open(document.getElementById('terminal')); 

  term.setOption('theme', {
    background: '#000000',
    foreground: '#29ff53',
    cursor: '#ffffff',
    cursorStyle: 'underscore',
    cursorBlink: true
  }); 

  // Set terminal size 
  term.resize(80,6);

  // Variables to handle commands 
  var curr_line = "";
  // var entries =[];

  function runBlogTerminal() {
    if (term._initialized) {
      return;
    }

    term._initialized = true;

    term.writeln('Blog shell: Powered by XtermJS.org');
    prompt(term);

    /* functions to handle commands */ 

    function lsCmd() {

      const Http = new XMLHttpRequest();
      const url = 'https://blog.younjinjeong.io/posts/';
     
      Http.open("GET", url);
      Http.send();

      Http.onreadystatechange = (e) => {
        // ToDo: parse Http response to get post lits ;
        // console.log(e);
        // document.write(Http.reponseText);
        // document.getElementsByClassName('container').innerHTML = (Http.responseText);
      };

      curr_line = ""; 
    
    }

    function moreCmd() {
      // ToDo: execute more command to display specified post 
      curr_line = "";
    }

    function findCmd() {
      // ToDo: execute search command to display search resutls  
      curr_line = "";
    }

    // Get key strokes and handle the commnad  

    term.onData(e => {

      switch (e) {
        case '\r': // Enter key triggers the handler. 
          if ( curr_line != "") {           
            switch (curr_line) {
              case "ls": 
                lsCmd(); 
                curr_line = "";
                break;
              case "clear": 
                term.clear(); 
                curr_line = "";
                break;
              case "find":
                findCmd();
                prompt(term);
                curr_line = "";
                break;
              default: 
                term.write("\r\nblog-shell: command not found");
                curr_line = "";
                // prompt(term);
            }
          }
            
        case '\u0003': // Ctrl+C
          prompt(term);
          break;
        case '\t': // TAB
          term.write('\r\nsupported commands:')
          term.write('\r\nls  clear   find');
          prompt(term);
          break;
        case '\u007F': // Backspace (DEL)
          // Do not delete the prompt
          if (term._core.buffer.x > 13) {  // related with length of the prompt 
            term.write('\b \b');
          }
          break;          
        default: // Print all other characters for demo
          term.write(e);
          curr_line += e; 
      }
    });
  }
  

  function prompt(term) {
    // term.write('\r\n$ ');
    term.write('\x1B[74;246;38m\r\nblog-shell\x1B[0m $ ')
  }
  runBlogTerminal();
});