<?php

class Media_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Dimension_model', 'dimension');
	}



	function get_list() {
		$this->db->select('id, filename, length, type, dimension_id');
		$this->db->from('medias');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		$this->db->order_by('filename'); 
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				unset($data[$row['id']]['id']);
				$data[$row['id']]['dimension'] = $this->dimension->get_name($row['dimension_id']);
				unset($data[$row['id']]['dimension_id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function get_one($id = NULL) {
	
		$this->db->select('id, filename, length, type, dimension_id');
		$this->db->from('medias');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('id', $id);
		$this->db->limit(1);
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			$data = $query->row_array();
		} else {
			foreach($query->field_data() as $row) {
				$data[$row->name] = NULL;
			}
		}
		
		return $data;
		
	}



	function get_name($id) {
		$this->db->select('filename');
		$this->db->where('id', $id);
		$result = $this->db->get('medias');
		
		if ($result->num_rows() > 0) return $result->row()->filename;

	} 



	function get_names_list() {
		$result = array();
		
		foreach($this->get_list() as $key => $value):
			$result[$key] = $value['name'];
		endforeach;
		
		return $result;
	} 

}

?>
