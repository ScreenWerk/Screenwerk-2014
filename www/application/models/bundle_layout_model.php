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


	function get_bundles_for_layout( $layout_id )
	{
      if( isset( $this->BundlesForLayout[$layout_id] ) )
      {
         return $this->BundlesForLayout[$layout_id];
      }
		$this->db->select('b.id, b.name, d.dimension_x as width, d.dimension_y as height, bl.position_x, bl.position_y, bl.position_z, bl.start_sec, bl.stop_sec');
		$this->db->from('bundles_layouts AS bl');
		$this->db->join('bundles AS b', 'b.id = bl.bundle_id');
		$this->db->join('dimensions AS d', 'd.id = bl.dimension_id');
		$this->db->where('bl.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('bl.layout_id', $layout_id);
		$this->db->order_by('bl.start_sec', 'asc'); 
		$this->db->order_by('bl.position_y', 'asc'); // why?
		$this->db->order_by('bl.position_x', 'asc'); // why?
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row)
			{
				$this->BundlesForLayout[$layout_id][$row['id']] = $row;
				//unset($this->BundlesForLayout[$collection_id][$row['id']]['id']);
			}
		} else {
			$this->BundlesForLayout[$layout_id] = array();
		}

		return $this->BundlesForLayout[$layout_id];
	}

}

?>
