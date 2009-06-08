<?php

class Log_model extends Model {

	function __construct() {
		parent::Model();
	}



	function write($type = NULL, $key = NULL, $message = NULL) {
		$data['user_id'] = $this->sess->user_id;
		$data['ip'] = $this->input->ip_address();
		$data['host'] = gethostbyaddr($this->input->ip_address());
		$data['agent'] = $this->input->user_agent();
		$data['url'] = current_url();
		$data['type'] = $type;
		$data['key'] = $key;
		$data['message'] = $message;
		$this->db->insert('log', $data);
	}



}

?>
