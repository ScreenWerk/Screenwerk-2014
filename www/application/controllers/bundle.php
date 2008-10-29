<?php

class Bundle extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Bundle_model', 'bundle');
		
		$this->session->protect('bundle');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->bundle->get_list();
		$view['page_menu_code'] = 'bundle';
		$view['page_submenu'] = array($this->router->class .'/add'=>'Add New '. humanize($this->router->class));
		$view['page_content'] = $this->load->view('table_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function edit($id = NULL) {
		
		if($this->input->post('save')) {
			$this->bundle->update();
			redirect($this->uri->segment(1));
		}

		if($this->input->post('cancel')) {
			redirect($this->uri->segment(1));
		}
		
		if($this->input->post('delete')) {
			$this->bundle->delete($this->input->post('id'));
			redirect($this->uri->segment(1));
		}
		
		$data = $this->bundle->get_one($id);
		
		$view['data'] = $data;
		$view['page_menu_code'] = 'bundle';
		$view['page_content'] = $this->load->view('edit_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function add() {
		$this->edit();
	}

}
?>
