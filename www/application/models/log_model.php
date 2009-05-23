<?php

class Log_model extends Model {

	function __construct() {
		parent::Model();
	}



	function write($message = NULL) {
		$data['user_id'] = $this->sess->user_id;
		$data['url'] = current_url();
		$data['ip'] = $this->input->ip_address();
		$data['host'] = gethostbyaddr($this->input->ip_address());
		$data['agent'] = $this->input->user_agent();
		$data['message'] = $message;
		$this->db->insert('log', $data);
	}



}

?>
