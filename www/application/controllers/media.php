<?php

class Media extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Media_model', 'media');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['upload_folder'] = '/'. $this->session->customer_id .'/';

		$view['data'] = $this->media->get_list();
		$view['page_menu_code'] = 'media';
		$view['page_menu_code'] = 'media';
		$view['show_edit_link'] = isset($this->session->forms[$this->router->class .'']);
		$view['page_content'] = $this->load->view('media/media_list', $view, True);
		$view['box_content'][] = $this->load->view('media/media_upload', $view, True);
		$this->load->view('main_page_view', $view);
	}

}
?>
