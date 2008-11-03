<?php

class Bundle extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Bundle_model', 'bundle');
		$this->load->model('Media_bundle_model', 'media_bundle');
		$this->load->model('Bundle_layout_model', 'bundle_layout');
		$this->load->model('Dimension_model', 'dimension');
		
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
		
		//todo: refactor to switch?

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
		
		if(isset($id)) {
			$data_m2m['media'] = $this->media_bundle->get_list(NULL, $id);
			foreach($data_m2m['media'] as &$row):
				unset($row['bundle_id']);
				unset($row['bundle']);
				unset($row['media_id']);
			endforeach;
			
			$data_m2m['layout'] = $this->bundle_layout->get_list($id, NULL);
			foreach($data_m2m['layout'] as &$row):
				unset($row['bundle_id']);
				unset($row['bundle']);
				unset($row['layout_id']);
				unset($row['dimension_id']);
			endforeach;

			$view['data_m2m'] = $data_m2m;
		}
		
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
