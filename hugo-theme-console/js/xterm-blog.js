$(function () {
  // HACK: This should be window.Terminal once upgraded to 4.0.1
  // var term = new window.Terminal.Terminal();
  var term = new Terminal();
  term.open(document.getElementById('terminal')); 

  term.setOption('theme', {
    background: 'white',
    foreground: 'black',
    cursor: 'green',
    cursorStyle: 'underscore',
    cursorBlink: true
  }); 

  term.resize(80,6);

  function runBlogTerminal() {
    if (term._initialized) {
      return;
    }

    term._initialized = true;


    /* 
     * Comment out until we have automated Cols setup 

    const observer = new ResizeObserver(entries => {

      console.log(term)
      const cellWidth = term._core.rederer.dimensions.actualCellWidth
      const cellHeight = term._core.renderer.dimensions.actualCellHeight
      const cols = Math.floor(entries[0].contentRect.width / cellWidth)
      const rows = Math.floor(entries[0].contentRect.height / cellHeight)

      term.resize(cols, rows); 
    })
    */

    /*
    term.prompt = () => {
      term.write('\x1B[1;3;31m\r\nblog-ctl\x1B[0m $');
    };
    */

    term.writeln('Blog shell - Powered by XtermJS.org');
    prompt(term);

    term.onData(e => {
      switch (e) {
        case '\r': // Enter
        case '\u0003': // Ctrl+C
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
          
      }
    });
  }

  function prompt(term) {
    // term.write('\r\n$ ');
    term.write('\x1B[74;246;38m\r\nblog-shell\x1B[0m $ ')
  }
  runBlogTerminal();
});