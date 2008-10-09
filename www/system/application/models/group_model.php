<?
class Group_model extends Model {

   function __construct()
   {
      parent::Model();
   }
   

   function users($group_id)
   {
      $query = $this->db->query( '
   SELECT u.* 
     FROM sw_users u
LEFT JOIN sw_groups_users gu on gu.user_id = u.id
    WHERE gu.group_id = '.$group_id.'
 ORDER BY u.username' );

      return $query->result_array();
   }
   
   function users_excl($group_id)
   {
      $query = $this->db->query( '
SELECT u.*
  FROM sw_users u 
 WHERE u.id not in
     ( SELECT gu.user_id
         FROM sw_groups_users gu
        WHERE gu.group_id = ' . $group_id . ' )
 ORDER BY u.username' );

      return $query->result_array();
   }

   function add_user()
   {
      $GroupedUsers['group_id'] = $_POST['group_id'];
      $GroupedUsers['user_id'] = $_POST['user_id'];
      $this->db->insert( 'groups_users', $GroupedUsers );
   }

   function remove_user( $group_id, $user_id )
   {
      $GroupedUsers['group_id'] = $group_id;
      $GroupedUsers['user_id'] = $user_id;
      $this->db->delete( 'groups_users', $GroupedUsers );
   }
   
   function forms($group_id)
   {
      $query = $this->db->query( '
   SELECT f.* 
     FROM sw_forms f
LEFT JOIN sw_forms_groups fg on fg.form_id = f.id
    WHERE fg.group_id = '.$group_id.'
 ORDER BY f.name' );

      return $query->result_array();
   }
   
   function forms_excl($group_id)
   {
      $query = $this->db->query( '
SELECT f.*
  FROM sw_forms f 
 WHERE f.id not in
     ( SELECT fg.form_id
         FROM sw_forms_groups fg
        WHERE fg.group_id = ' . $group_id . ' )
 ORDER BY f.name' );

      return $query->result_array();
   }

   function add_form()
   {
      $GroupForms['group_id'] = $_POST['group_id'];
      $GroupForms['form_id'] = $_POST['form_id'];
      $this->db->insert( 'forms_groups', $GroupForms );
   }

   function remove_form( $group_id, $form_id )
   {
      $GroupForms['group_id'] = $group_id;
      $GroupForms['form_id'] = $form_id;
      $this->db->delete( 'forms_groups', $GroupForms );
   }
   
   function delete($id)
   {
      $this->db->delete( 'groups', $id );
   }
   
   function create($groupname)
   {
      return $this->insert($groupname);
   }

   function insert($groupname)
   {
      $Group['groupname'] = $groupname;
      $this->db->where($Group);
      $query = $this->db->get('groups');
      if( $query->num_rows() == 1 )
      {
         return $query->row_array();
      }
      $this->db->insert( 'groups', $Group );
      $Group['id'] = $this->db->insert_id();
      return $Group;
   }

   function save($Group)
   {
      return $this->update($Group['id'],$Group['groupname']);
   }
   
   function update($id,$groupname)
   {
      $Group['id'] = $id;
      $this->db->where($Group);
      $Group['groupname'] = $groupname;
      $this->db->update('groups',$Group);
   }

}
?>
