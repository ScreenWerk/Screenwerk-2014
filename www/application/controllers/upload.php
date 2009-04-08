<?php

class Upload extends Controller {

	function __construct() {
		parent::Controller();

		//$this->output->enable_profiler(TRUE);      

	}
	        
	function index() {

		$view['page_menu_code'] = 'upload';
		$view['page_content'] = $this->load->view('upload_view', $view, True);
		$this->load->view('main_page_view', $view);

	}



	function do_upload() {
	
		$config['upload_path'] = DIR_FTP_INCOMING;
		$config['allowed_types'] = 'zip|bmp|gif|jpg|jpeg|png|mpg|mpeg|m4v|mv4|avi';
		$config['remove_spaces'] = TRUE;

		$this->load->library('upload', $config);
	
		if ( ! $this->upload->do_upload('upload_file')) {
			$view['error'] = 'ERROR: '.$this->upload->display_errors();
		} else {
			$view['data'] = $this->upload->data();
		}

		$view['page_menu_code'] = 'upload';
		$view['page_content'] = $this->load->view('upload_view', $view, True);
		$this->load->view('main_page_view', $view);

	}	
	
	function __array_search_recursive($needle, $haystack) {     
    foreach ($haystack as $k => $v) {
      for ($i=0; $i<count($v); $i++)
        if ($v[$i] === $needle) return $k;
    	}
  	}
	}

?>
