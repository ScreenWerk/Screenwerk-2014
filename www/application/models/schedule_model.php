<?php

class Schedule_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Dimension_model', 'dimension', TRUE);
	}



	function get_list() {
		$this->db->select('id, name, dimension_id');
		$this->db->from('schedules');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		$this->db->order_by('name'); 
		$query = $this->db->get();
		
		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				$data[$row['id']]['dimension'] = $this->dimension->get_name($row['dimension_id']);
				unset($data[$row['id']]['dimension_id']);
				unset($data[$row['id']]['id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}



	function get_one($id = NULL) {
	
		$this->db->select('id, name, dimension_id');
		$this->db->from('schedules');
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
		$this->db->select('name');
		$this->db->where('id', $id);
		$result = $this->db->get('schedules');
		
		if ($result->num_rows() > 0) return $result->row()->name;

	} 



	function get_names_list() {
		foreach($this->get_list() as $key => $value):
			$result[$key] = $value['name'];
		endforeach;
		
		return $result;
	} 



	function delete($id) {
		$this->db->where('id', $id);
		$this->db->delete('schedules');
	}



	function update() {
		$data = array(
			'name' => $this->input->post('name'),
			'dimension_id' => $this->input->post('dimension')
		);
		if($this->input->post('id') > 0) {
			$this->db->where('id', $this->input->post('id'));
			$this->db->update('schedules', $data);
		} else {
			$data['customer_id'] = $_SESSION['user']['customer_id'];
			$this->db->insert('schedules', $data);
		}
	}



}

?>
