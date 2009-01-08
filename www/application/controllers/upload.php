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
	
		global $mimes;
		if (count($mimes) == 0) @require_once(APPPATH.'config/mimes'.EXT);
		
		$config['upload_path'] = '../ftp/incoming/';
		$config['allowed_types'] = $this->__array_search_recursive($_FILES['upload_file']['type'], $mimes);
		$config['remove_spaces'] = TRUE;

		$this->load->library('upload', $config);
	
		if ( ! $this->upload->do_upload('upload_file')) {
			$view['error'] = $this->upload->display_errors();
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
