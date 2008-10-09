<?
class Layout_model extends Model {
    
    function __construct()
    {
        parent::Model();
        $this->load->model('Dimension_model','Dimension',TRUE);
        $this->load->model('Bundle_model','Bundle',TRUE);
    }
    
    
    
    function find($id)
    {
        $this->db->where('id='.$id);
        $query = $this->db->get( 'layouts' );
        return $query->row_array();
    }
   
   
   
   function involved_medias($id)
   {
      $_involved_medias = array();
      
      $LayoutBundles = $this->list_layout_bundles($id);
      foreach( $LayoutBundles as $_lb_id => $LayoutBundle )
      {
         $_bim = $this->Bundle->involved_medias( $_lb_id );
         $_involved_medias = array_merge( $_involved_medias, $_bim );
      }
      array_multisort( array_keys($_involved_medias), $_involved_medias );
#      var_dump($_involved_medias);
      return ($_involved_medias);
   }      
    
    
    
   function playlist($id)
   {
      $LayoutBundles = $this->list_layout_bundles($id);
      foreach( $LayoutBundles as $_id => &$LayoutBundle )
      {
         $LayoutBundle['Medias'] = $this->Bundle->playlist($_id);
      }
#      var_dump($LayoutBundles);
      return ($LayoutBundles);
   }      
    
    
    
   function list_layout_bundles($id)
   {
      $ret_bundles = array();
      if( isset( $this->ListLayoutBundles[$id] ) ) return $this->ListLayoutBundles[$id];
      
      $query = $this->db->query( 'SELECT b.id, b.name, bl.dimension_id, bl.position_x, bl.position_y, bl.position_z, bl.start_sec, bl.stop_sec FROM sw_bundles b 
left join sw_bundles_layouts bl on bl.bundle_id = b.id
where bl.layout_id = '.$id.'
order by bl.start_sec, position_y, position_x' );
      foreach( $query->result_array() as $_bundle )
      {
         $_id = $_bundle['id'];
         unset( $_bundle['id'] );
         $_dimension = $this->Dimension->find($_bundle['dimension_id']);
         $_bundle['width'] = $_dimension['dimension_x'];
         $_bundle['height'] = $_dimension['dimension_y'];
         unset( $_bundle['dimension_id'] );
         $ret_bundles[$_id] = $_bundle;
      }
      $this->ListLayoutBundles[$id] = $ret_bundles;
      return $ret_bundles;
   }
   
   
   
   function list_bundles_excl($id)
   {
      $ret_bundles = array();

      $query = $this->db->query( 'SELECT id, name FROM sw_bundles
where id not in
( SELECT distinct b.id FROM sw_bundles b 
left join sw_bundles_layouts bl on bl.bundle_id = b.id
where bl.layout_id = '.$id.' )
order by name' );
      foreach( $query->result_array() as $_bundle )
      {
         $ret_bundles[$_bundle['id']] = $_bundle['name'];
      }
      return $ret_bundles;
   }
   
   
   
   function add_bundle()
   {
      $Dimension = $this->Dimension->createfind($_POST['width'],$_POST['height']);
      $LB['layout_id'] = $_POST['id'];
      $LB['bundle_id'] = $_POST['bundle_id'];
      $LB['dimension_id'] = $Dimension['id'];
      $LB['position_x'] = $_POST['position_x'];
      $LB['position_y'] = $_POST['position_y'];
//      $LB['position_z'] = $_POST['position_z'];
      $LB['start_sec'] = $_POST['start_sec'];
      $LB['stop_sec'] = $_POST['stop_sec'];
      $this->db->insert( 'bundles_layouts', $LB );
   }
   
   
   //
   // remove bundle from layout
   //
   function remove_layoutbundle( $layout_id, $bundle_id )
   {
      $LB['layout_id'] = $layout_id;
      $LB['bundle_id'] = $bundle_id;
      $this->db->delete( 'bundles_layouts', $LB );
   }
   
   
   
   //
   // remove bundle from all layouts
   //
   function remove_bundle( $bundle_id )
   {
      $LB['bundle_id'] = $bundle_id;
      $this->db->delete( 'bundles_layouts', $LB );
   }
   
   
   
    function delete($id)
    {
        $CL['layout_id'] = $id;
        $this->db->delete( 'layouts_collections', $CL );

        $L['id'] = $id;
        $this->db->delete( 'layouts', $L );
    }
    function get_last_ten()
    {
        $query = $this->db->get('layouts', 10);
        return $query->result_array();
    }
    
    function create($name,$length,$width,$height)
    {
        $Dimension = $this->Dimension->createfind($width,$height);
        return $this->insert($name,$length,$Dimension['id']);
    }
    function insert($name,$length,$dimension_id)
    {
        $Layout['dimension_id'] = $dimension_id;
        $Layout['name'] = $name;
        $Layout['length'] = $length;
        $this->db->where($Layout);
        $query = $this->db->get('layouts');
        if( $query->num_rows() == 1 )
        {
            return $query->row_array();
        }
        $this->db->insert( 'layouts', $Layout );
        $Layout['id'] = $this->db->insert_id();
        return $Layout;
    }



   function save($Layout)
   {
      return $this->update($Layout['id'],$Layout['name'],$Layout['length'],$Layout['dimension_id']);
   }
   
   function update($id,$name,$length,$dimension_id)
   {
      $Layout['id'] = $id;
      $this->db->where($Layout);
      $Layout['name'] = $name;
      $Layout['length'] = $length;
      $Layout['dimension_id'] = $dimension_id;
      $this->db->update('layouts',$Layout);
   }

}
?>
