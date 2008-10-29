<?php

class Media extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Media_model', 'media');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->media->get_list();
		$view['page_menu_code'] = 'media';
		$view['page_menu_code'] = 'media';
		$view['show_edit_link'] = isset($this->session->forms[$this->router->class .'']);
		$view['page_content'] = $this->load->view('table_view', $view, True);
		$this->load->view('main_page_view', $view);
	}

}
?>
