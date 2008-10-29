<?php

class Layout extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Layout_model', 'layout');
		$this->load->model('Dimension_model', 'dimension');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->layout->get_list();
		$view['page_menu_code'] = 'layout';
		$view['page_submenu'] = array($this->router->class .'/add'=>'Add New '. humanize($this->router->class));
		$view['page_content'] = $this->load->view('table_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function edit($id = NULL) {
		
		if($this->input->post('save')) {
			$this->layout->update();
			redirect($this->uri->segment(1));
		}

		if($this->input->post('cancel')) {
			redirect($this->uri->segment(1));
		}
		
		if($this->input->post('delete')) {
			$this->layout->delete($this->input->post('id'));
			redirect($this->uri->segment(1));
		}
		
		$data = $this->layout->get_one($id);
		
		$data['dimension']['value'] = $data['dimension_id'];
		unset($data['dimension_id']);
		foreach($this->dimension->get_names_list() as $dimension_key => $dimension_value) {
			$data['dimension']['list'][$dimension_key] = $dimension_value;
		}
		
		$view['data'] = $data;
		$view['page_menu_code'] = 'layout';
		$view['page_content'] = $this->load->view('edit_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function add() {
		$this->edit();
	}

}
?>
