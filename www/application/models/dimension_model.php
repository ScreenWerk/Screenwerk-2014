<?php

class Dimension_model extends Model {

	function __construct() {
			parent::Model();
			//$this->load->model('Aspect_model','Aspect',TRUE);
	}



	function get_list() {
		$this->db->select('id, dimension_x, dimension_y');
		$this->db->from('dimensions');
		$this->db->order_by('dimension_x'); 
		$this->db->order_by('dimension_y'); 
		$query = $this->db->get()->result_array();
		
		foreach($query as $row) {
			$data[$row['id']] = $row;
			unset($data[$row['id']]['id']);
		}
		return $data;
	}



	function get_name($id) {
		$this->db->select('dimension_x, dimension_y');
		$this->db->where('id', $id);
		$result = $this->db->get('dimensions');
		
		if ($result->num_rows() > 0) return $result->row()->dimension_x .'x'. $result->row()->dimension_y;

	} 



	function get_names_list() {
		$result = array();
	
		foreach($this->get_list() as $key => $value):
			$result[$key] = $value['dimension_x'] .'x'. $value['dimension_y'];
		endforeach;
		
		return $result;
	} 



}
?>
