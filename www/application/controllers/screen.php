<?php

class Screen extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Screen_model', 'screen');
		$this->load->model('Dimension_model', 'dimension');
		$this->load->model('Schedule_model', 'schedule');
		
		$this->session->protect('screen');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->screen->get_list();
		$view['page_menu_code'] = 'screen';
		$view['page_content'] = $this->load->view('table_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function edit($id = NULL) {
		
		if($this->input->post('save')) {
			$this->screen->update();
			redirect($this->uri->segment(1));
		}

		if($this->input->post('cancel')) {
			redirect($this->uri->segment(1));
		}
		
		if($this->input->post('delete')) {
			$this->screen->delete($this->input->post('id'));
			redirect($this->uri->segment(1));
		}
		
		$data = $this->screen->get_one($id);
		
		$data['dimension']['value'] = $data['dimension_id'];
		unset($data['dimension_id']);
		foreach($this->dimension->get_names_list() as $dimension_key => $dimension_value) {
			$data['dimension']['list'][$dimension_key] = $dimension_value;
		}
		$data['schedule']['value'] = $data['schedule_id'];
		unset($data['schedule_id']);
		foreach($this->schedule->get_names_list() as $schedule_key => $schedule_value) {
			$data['schedule']['list'][$schedule_key] = $schedule_value;
		}
		
		$view['data'] = $data;
		$view['page_menu_code'] = 'screen';
		$view['page_content'] = $this->load->view('edit_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function add() {
		$this->edit();
	}

}
?>
