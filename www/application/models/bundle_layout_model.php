<?php

class Bundle_layout_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Bundle_model', 'bundle');
		$this->load->model('Layout_model', 'layout');
		$this->load->model('Dimension_model', 'dimension');
	}



	function get_list($bundle_id = NULL, $layout_id = NULL) {
		$this->db->select('id, bundle_id, layout_id, dimension_id, position_x, position_y, position_z, start_sec, stop_sec');
		$this->db->from('bundles_layouts');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		if(isset($bundle_id)) $this->db->where('bundle_id', $bundle_id);
		if(isset($layout_id)) $this->db->where('layout_id', $layout_id);
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				unset($data[$row['id']]['id']);
				$data[$row['id']]['bundle'] = $this->bundle->get_name($row['bundle_id']);
				$data[$row['id']]['layout'] = $this->layout->get_name($row['layout_id']);
				$data[$row['id']]['dimension'] = $this->dimension->get_name($row['dimension_id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}

}

?>
